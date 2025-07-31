import actionCmds from './action';
import appCmds from './app-managerment';
import elementCmds from './element';
import fileCmds from './file';
import findCmds from './find';
import gestureCmds from './gestures';
import keycodeCmds from './keycode';
import screenCmds from './screen';
import systemCmds from './system';
import viewportCmds from './viewport';


const commands = {};
Object.assign(
  commands,
  actionCmds,
  appCmds,
  fileCmds,
  findCmds,
  elementCmds,
  gestureCmds,
  keycodeCmds,
  screenCmds,
  systemCmds,
  viewportCmds,
);

export { commands };
export default commands;
