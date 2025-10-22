
import React, { useState, useMemo, useCallback } from 'react';
import { CalculationState, HumiditySource } from './types';
import { convert } from './utils/conversions';
import { getExplanation } from './services/geminiService';
import InputControl from './components/InputControl';
import { Thermometer, Droplets, Snowflake, Wind } from 'lucide-react';

const App: React.FC = () => {
  const initialState: CalculationState = {
    temperature: '',
    relativeHumidity: '',
    dewPoint: '',
    absoluteHumidity: '',
  };

  const [values, setValues] = useState<CalculationState>(initialState);
  const [source, setSource] = useState<HumiditySource | null>(null);
  const [error, setError] = useState<string>('');
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  const handleInputChange = (field: keyof CalculationState, value: string) => {
    setIsCalculated(false);
    setAiExplanation('');
    setError('');

    const newValues: CalculationState = { ...values, [field]: value };

    if (field !== 'temperature') {
      const newSource = field as HumiditySource;
      setSource(newSource);
      
      // Clear other humidity fields
      if (newSource === 'relativeHumidity') {
        newValues.dewPoint = '';
        newValues.absoluteHumidity = '';
      } else if (newSource === 'dewPoint') {
        newValues.relativeHumidity = '';
        newValues.absoluteHumidity = '';
      } else if (newSource === 'absoluteHumidity') {
        newValues.relativeHumidity = '';
        newValues.dewPoint = '';
      }
    }
    setValues(newValues);
  };

  const isCalculationDisabled = useMemo(() => {
    if (!values.temperature) return true;
    if (!source) return true;
    return !values[source];
  }, [values, source]);

  const handleCalculate = useCallback(() => {
    setError('');
    setIsCalculated(false);

    if (isCalculationDisabled) {
      setError('Please provide a temperature and at least one other value.');
      return;
    }

    const temp = parseFloat(values.temperature);
    const sourceValue = parseFloat(values[source!]);

    if (isNaN(temp) || isNaN(sourceValue)) {
      setError('Please enter valid numbers.');
      return;
    }

    try {
      const result = convert(temp, sourceValue, source!);
      setValues({
        temperature: values.temperature,
        relativeHumidity: result.relativeHumidity.toFixed(2),
        dewPoint: result.dewPoint.toFixed(2),
        absoluteHumidity: result.absoluteHumidity.toFixed(2),
      });
      setIsCalculated(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during calculation.');
      }
    }
  }, [values, source, isCalculationDisabled]);

  const handleReset = useCallback(() => {
    setValues(initialState);
    setSource(null);
    setError('');
    setIsCalculated(false);
    setAiExplanation('');
    setIsExplanationLoading(false);
  }, [initialState]);
  
  const handleGetExplanation = async () => {
    setIsExplanationLoading(true);
    setAiExplanation('');
    setError('');
    try {
      const explanation = await getExplanation({
        temperature: parseFloat(values.temperature),
        relativeHumidity: parseFloat(values.relativeHumidity),
        dewPoint: parseFloat(values.dewPoint),
        absoluteHumidity: parseFloat(values.absoluteHumidity),
      });
      setAiExplanation(explanation);
    } catch(e) {
        if (e instanceof Error) {
            setError(`Failed to get explanation: ${e.message}`);
        } else {
            setError('An unknown error occurred while fetching the explanation.');
        }
    } finally {
        setIsExplanationLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Humidity Converter Pro
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Instantly convert between different humidity measurements.
          </p>
        </header>

        <main className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/50 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <InputControl
              label="Temperature"
              unit="°C"
              value={values.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              icon={<Thermometer className="w-5 h-5 text-red-400" />}
            />
            <InputControl
              label="Relative Humidity"
              unit="%"
              value={values.relativeHumidity}
              onChange={(e) => handleInputChange('relativeHumidity', e.target.value)}
              icon={<Droplets className="w-5 h-5 text-blue-400" />}
            />
            <InputControl
              label="Dew Point"
              unit="°C"
              value={values.dewPoint}
              onChange={(e) => handleInputChange('dewPoint', e.target.value)}
              icon={<Snowflake className="w-5 h-5 text-cyan-300" />}
            />
            <InputControl
              label="Absolute Humidity"
              unit="g/m³"
              value={values.absoluteHumidity}
              onChange={(e) => handleInputChange('absoluteHumidity', e.target.value)}
              icon={<Wind className="w-5 h-5 text-slate-300" />}
            />
          </div>

          {error && <div className="text-red-400 text-center mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">{error}</div>}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCalculate}
              disabled={isCalculationDisabled}
              className="w-full sm:w-auto text-lg font-semibold px-8 py-3 rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Calculate
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto text-lg font-semibold px-8 py-3 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-all duration-300"
            >
              Reset
            </button>
          </div>
          
          {isCalculated && (
            <div className="mt-8 pt-6 border-t border-slate-700 text-center">
              <button
                onClick={handleGetExplanation}
                disabled={isExplanationLoading}
                className="text-lg font-semibold px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
              >
                {isExplanationLoading ? 'Analyzing...' : 'Get AI Explanation'}
              </button>
            </div>
          )}

          {aiExplanation && (
            <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">Atmospheric Conditions Explained</h3>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{aiExplanation}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
