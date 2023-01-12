const request = require('supertest')
const { User } = require('../../models/user')

let server
let username
let password
let secret

describe('/api/users', () => {
    beforeEach(() => {
        server = require('../../index')

        username = 'username'
        password = 'password'
        secret = 'secret'
    })

    afterEach(async () => {
        await server.close()
        await User.deleteMany({})
    })

    describe('POST /', () => {
        const exec = async () => {
            return await request(server)
                .post('/api/users')
                .send({ username, password, secret })
            }

        it('should return 400 if username not provided', async () => {
            username = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })
        it('should return 400 if password not provided', async () => {
            password = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })
        it('should return 400 if secret key doesnt match', async () => {
            secret='abcdefg'

            const res = await exec()

            expect(res.status).toBe(400)
        })
        it('should save user if valid', async () => {
            await exec()

            const user = await User.find({
                username: 'username'
            })

            expect(user).not.toBeNull()
        })
        it('should return user if valid', async () => {
            const res = await exec()

            expect(res.body).toHaveProperty('_id')
            expect(res.body).tohaveProperty('username', 'username')
            expect(res.body).toHaveProperty('password')
        })
    })
})