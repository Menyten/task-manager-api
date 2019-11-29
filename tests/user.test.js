const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { 
  userOneId,
  userOne,
  setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const res = await request(app).post('/users').send({
    name: 'Joel Pedersen',
    email: 'joel.pedersen97@gmail.com',
    password: 'joelspassword'
  }).expect(201);

  // Assert that the db was changed correctly
  const user = await User.findById(res.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  expect(res.body).toMatchObject({
    user: {
      name: 'Joel Pedersen',
      email: 'joel.pedersen97@gmail.com',
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('joelspassword')
})

test('Should login an existing user', async () => {
  const res = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200);

  // Assert that token in response matches users second token
  const user = await User.findById(userOneId);
  expect(res.body.token).toBe(user.tokens[1].token)
})

test('Should not login a nonexistent user', async () => {
  await request(app).post('/users/login').send({
    email: 'joel@gmail.com',
    password: userOne.password
  }).expect(400);
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
})

test('should not get profile for unauth user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
})

test('should delete account', async () => {
  const res = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that the db was changed correctly
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('should not delete unauthenticated account', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/fredag.jpg')
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update users name', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Sami Harudd'
    })
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Sami Harudd')
});

test('Should not update invalid field', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Sweden'
    })
    .expect(400)
});