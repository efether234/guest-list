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
        const exec = async () => {
            return await request(server)
                .get('/api/guests')
                .set('X-Auth-Token', token)
        }
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
            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(g => g.lastName === 'lastname1')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'firstname1')).toBeTruthy()
            expect(res.body.some(g => g.lastName === 'lastname2')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'firstname2')).toBeTruthy()
        })
        it('should return 401 if not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401)
        })
    })

    describe('POST /', () => {
        let lastName
        let firstName
        
        const exec = async () => {
            return await request(server)
                .post('/api/guests')
                .set('X-Auth-Token', token)
                .send({ lastName, firstName })
        }

        beforeEach(() => {
            lastName = 'lastName1'
            firstName = 'firstName1'
        })

        it('should return 401 if not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401)
        })

        it('should save guest if valid', async () => {
            await exec()

            const guest = await Guest.find({
                lastName: 'lastName1',
                firstName: 'firstName1'
            })

            expect(guest).not.toBeNull();
        })

        it('should return guest if valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('lastName', 'lastName1')
            expect(res.body).toHaveProperty('firstName', 'firstName1')
        })
    })

    describe('PUT /_id', () => {
        let guest
        let id
        let newFirstName

        const exec = async () => {
            return await request(server)
                .put('/api/guests/' + id)
                .set('X-Auth-Token', token)
                .send({ firstName: newFirstName})
        }

        beforeEach(async () => {
            guest = new Guest({
                lastName: 'lastName1',
                firstName: 'firstName1',
                addedBy: new User()._id
            })
            await guest.save()

            id = guest._id
            newFirstName = 'newFirstName'
        })

        it('should return 401 if not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401)
        })

        it('should return 404 if id is invalid', async () => {
            id = mongoose.Types.ObjectId()

            const res = await exec()

            expect(res.status).toBe(404)
        })

        it('should update the guest if input is valid', async () => {
            await exec()

            const updatedGuest = await Guest.findById(guest._id)

            expect(updatedGuest.firstName).toBe(newFirstName)
        })

        it('should return updated guest if valid', async () => {
            const res = await exec()

            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('firstName', newFirstName)
        })
    })

    describe('DELETE /', () => {
        let id
        let guest

        const exec = async () => {
            return await request(server)
                .delete('/api/guests/' + id)
                .set('X-Auth-Token', token)
                .send()
        }

        beforeEach(async () => {
            guest = new Guest({
                lastName: 'lastName',
                firstName: 'firstName',
                addedBy: new User()._id
            })
            await guest.save()

            id = guest._id
        })

        it('should return 401 if not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401)
        })

        it('should return 404 if no guest with id was found', async () => {
            id = mongoose.Types.ObjectId()

            const res = await exec()

            expect(res.status).toBe(404)
        })

        it('should delete the genre if input is valid', async () => {
            await exec()

            const guestInDb = await Guest.findById(id)

            expect(guestInDb).toBeNull()
        })

        it('should return the removed genre', async () => {
            const res = await exec()

            console.log(`NAME:: ${guest.name}`)

            expect(res.body).toHaveProperty('_id', guest._id.toHexString())
            expect(res.body).toHaveProperty('lastName', guest.lastName)
            expect(res.body).toHaveProperty('firstName', guest.firstName)
        })
    })
})