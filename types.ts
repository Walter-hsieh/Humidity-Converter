
export interface CalculationState {
  temperature: string;
  relativeHumidity: string;
  dewPoint: string;
  absoluteHumidity: string;
}

export type HumiditySource = 'relativeHumidity' | 'dewPoint' | 'absoluteHumidity';
