const request = require('supertest')
const mongoose = require('mongoose')
const { Guest } = require('../../models/guest')
const { User } = require('../../models/user')

let server
let token

describe('/api/guests', () => {
    beforeEach(() => {
        server = require('../../index')
        token = new User().generateAuthToken()
    })
    afterEach(async () => {
        await server.close()
        await Guest.deleteMany({})
    })

    describe('GET /', () => {
        beforeEach(async () => {
            const guests = [
                {
                    lastName: 'lastname1',
                    firstName: 'firstname1'
                },
                {
                    lastName: 'lastname2',
                    firstName: 'firstname2'
                }
            ]

            await Guest.collection.insertMany(guests)
        })
        it('should return all guests', async () => {
            const res = await request(server)
                .get('/api/guests')
                .set('X-Auth-Token', token)

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(g => g.lastName === 'lastname1')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'firstname1')).toBeTruthy()
            expect(res.body.some(g => g.lastName === 'lastname2')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'firstname2')).toBeTruthy()
        })
    it('should return 401 if not logged in', async () => {
        token = ''

        const res = await request(server)
            .get('/api/guests')
            .set('X-Auth-Token', token)

        expect(res.status).toBe(401)
    })
    })
})