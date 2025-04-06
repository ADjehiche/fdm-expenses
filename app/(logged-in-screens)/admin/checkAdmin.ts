import { User } from '../../../backend/user'; // Adjust the path as necessary

export function checkIfAdmin(user: User) {
  if (!user) {
    throw Error('User is not logged in.');
  }
  
  if (user.getEmployeeRole().getType() !== 'Administrator') {
    throw Error('Access Denied: You do not have Administrator permissions.');
  }
}
