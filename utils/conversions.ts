
import { HumiditySource } from '../types';
import { SPECIFIC_GAS_CONSTANT_WATER_VAPOR } from '../constants';

// August-Roche-Magnus formula to calculate saturation vapor pressure (e_s) in kPa from temperature in Celsius.
function getSaturationVaporPressure(tempC: number): number {
  return 0.61094 * Math.exp((17.625 * tempC) / (243.04 + tempC));
}

// Calculates dew point from relative humidity and temperature.
function rhToDp(rh: number, tempC: number): number {
  if (rh < 0.1 || rh > 100) throw new Error("Relative humidity must be between 0 and 100.");
  const e_s = getSaturationVaporPressure(tempC);
  const e = (rh / 100) * e_s; // Actual vapor pressure
  const ln_e = Math.log(e / 0.61094);
  return (243.04 * ln_e) / (17.625 - ln_e);
}

// Calculates relative humidity from dew point and temperature.
function dpToRh(dp: number, tempC: number): number {
  if (dp > tempC) throw new Error("Dew point cannot be greater than temperature.");
  const e_s_dp = getSaturationVaporPressure(dp); // Actual vapor pressure
  const e_s_temp = getSaturationVaporPressure(tempC);
  const rh = (e_s_dp / e_s_temp) * 100;
  return rh > 100 ? 100 : rh; // Cap at 100%
}

// Calculates absolute humidity (g/m^3) from relative humidity and temperature.
function rhToAh(rh: number, tempC: number): number {
  const e_s = getSaturationVaporPressure(tempC);
  const e = (rh / 100) * e_s; // Actual vapor pressure in kPa
  const tempK = tempC + 273.15;
  // AH in kg/m^3 = (e * 1000) / (Rv * T)
  // Multiply by 1000 to get g/m^3
  return (e * 1000 * 1000) / (SPECIFIC_GAS_CONSTANT_WATER_VAPOR * tempK);
}

// Calculates relative humidity from absolute humidity (g/m^3) and temperature.
function ahToRh(ah: number, tempC: number): number {
  const tempK = tempC + 273.15;
  // e = (AH * Rv * T) / 1000, where AH is in kg/m^3
  const e = ( (ah/1000) * SPECIFIC_GAS_CONSTANT_WATER_VAPOR * tempK) / 1000; // actual vapor pressure in kPa
  const e_s = getSaturationVaporPressure(tempC);
  const rh = (e / e_s) * 100;
  return rh > 100 ? 100 : rh; // Cap at 100%
}

interface ConversionResult {
  relativeHumidity: number;
  dewPoint: number;
  absoluteHumidity: number;
}

export function convert(tempC: number, sourceValue: number, source: HumiditySource): ConversionResult {
  let relativeHumidity: number;
  let dewPoint: number;
  let absoluteHumidity: number;

  switch (source) {
    case 'relativeHumidity':
      relativeHumidity = sourceValue;
      dewPoint = rhToDp(relativeHumidity, tempC);
      absoluteHumidity = rhToAh(relativeHumidity, tempC);
      break;

    case 'dewPoint':
      dewPoint = sourceValue;
      relativeHumidity = dpToRh(dewPoint, tempC);
      absoluteHumidity = rhToAh(relativeHumidity, tempC);
      break;

    case 'absoluteHumidity':
      absoluteHumidity = sourceValue;
      relativeHumidity = ahToRh(absoluteHumidity, tempC);
      dewPoint = rhToDp(relativeHumidity, tempC);
      break;
      
    default:
        throw new Error("Invalid conversion source provided.");
  }
  
  return { relativeHumidity, dewPoint, absoluteHumidity };
}
