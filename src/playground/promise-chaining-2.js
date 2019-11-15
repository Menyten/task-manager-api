require('../db/mongoose');
const Task = require('../models/task');

/* Task.findByIdAndDelete('5dbf294ec5f93d1388f77f8b').then(user => {
  console.log('User', user);
  return Task.countDocuments({ completed: false });
}).then(result => {
  console.log(result);
}).catch(e => {
  console.log(e);
}) */

const deleteTaskAndCount = async id => {
  await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({ completed: false });
  return count;
}

deleteTaskAndCount('5dbf30d43078a80bec6eca46').then(res => {
  console.log(res);
}).catch(e => {
  console.log(e);
})