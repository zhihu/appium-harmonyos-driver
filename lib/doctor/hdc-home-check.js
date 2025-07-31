import { fs, doctor } from '@appium/support';

/** @satisfies {import('@appium/types').IDoctorCheck} */
class EnvVarHdcHomeCheck {

  /**
   * @param {string} varName
   */
  constructor(varName) {
    this.varName = varName;
  }

  async diagnose() {
    const varValue = process.env[this.varName];
    if (typeof varValue === 'undefined') {
      return doctor.nok(`${this.varName} environment variable is NOT set!`);
    }
    if (await fs.exists(varValue)) {
      return doctor.ok(`${this.varName} is set to:${varValue}`);
    }
    return doctor.nok(`${this.varName} is set to '${varValue}' but is NOT a valid path!`);
  }

  async fix() {
    return await Promise.resolve(`Make sure the ${this.varName} is properly configured for Appium server process`);
  }

  hasAutofix() {
    return false;
  }

  isOptional() {
    return false;
  }

}

const hdcHomeCheck = new EnvVarHdcHomeCheck('HDC_HOME');
export { hdcHomeCheck };

/**
 * @typedef {import('@appium/types').DoctorCheckResult} CheckResult
 */