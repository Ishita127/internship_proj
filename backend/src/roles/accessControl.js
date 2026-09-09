import { AccessControl } from 'accesscontrol';
import { ROLES } from './roles.list.js';

const ac = new AccessControl();

ac.grant(ROLES.CUSTOMER)
  .readAny('product')
  .createOwn('order')
  .readOwn('order')
  .createOwn('review');

ac.grant(ROLES.ADMIN)
  .extend(ROLES.CUSTOMER)
  .readAny('profile')
  .createAny('product')
  .updateAny('product')
  .deleteAny('product')
  .readAny('order')
  .updateAny('order');

export default ac;