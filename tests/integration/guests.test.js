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

        it('should return 400 if lastName not provided', async () => {
            lastName = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })

        it('should return 400 if firstName not provided', async () => {
            firstName = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })

        it('should return 400 if lastName and firstName are not provided', async () => {
            lastName = ''
            firstName = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })

        it('should save guest if valid', async () => {
            await exec()

            const guest = await Guest.find({
                lastName: 'lastName1',
                firstName: 'firstName1'
            })

            expect(guest).not.toBeNull()
        })

        it('should return guest if valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('lastName', 'lastName1')
            expect(res.body).toHaveProperty('firstName', 'firstName1')
        })
    })

    describe('POST /search', () => {
        let lastName
        let firstName

        const exec = async () => {
            return await request(server)
                .post('/api/guests/search')
                .send({ lastName, firstName })
        }

        beforeEach(async () => {
            const userId = new User()._id
            const guests = [
                {
                    lastName: 'doe',
                    firstName: 'john',
                    otherNames: ['judy']
                },
                {
                    lastName: 'doe',
                    firstName: 'jane'
                },
                {
                    lastName: 'straw',
                    firstName: 'jack'
                }
            ]

            await Guest.collection.insertMany(guests)
        })

        it('should return multiple guests if only last name supplied and has multiple matches', async () => {
            lastName = 'doe'
            firstName = ''
            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(g => g.lastName === 'doe')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'john')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'jane')).toBeTruthy()
        })

        it('should return one guest if only last name supplied and has one match', async () => {
            lastName = 'straw'
            firstName = ''
            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body.some(g => g.lastName === 'straw')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'jack')).toBeTruthy()
        })

        it('should return one guest if last name and one "other name" match', async () => {
            lastName = 'doe'
            firstName = 'judy'
            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body.some(g => g.lastName === 'doe')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'john')).toBeTruthy()
        })

        it('should return guest(s) if first and last name are supplied', async () => {
            lastName = 'doe'
            firstName = 'jane'
            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body.some(g => g.lastName === 'doe')).toBeTruthy()
            expect(res.body.some(g => g.firstName === 'jane')).toBeTruthy()
            expect(res.body.some(g => g.firstName !== 'john')).toBeTruthy()
        })

        it('should return 0 guests if database has no matches', async () => {
            lastName = 'jones'
            firstName = 'casey'
            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(0)
        })
    })

    describe('PUT /:id', () => {
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
                firstName: 'firstName1'
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

        it('should return 404 if id doesnt exist', async () => {
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

    describe('PUT /:id/rsvp', () => {
        let id
        let email
        let attending
        let plusses
        let dietaryRestrictions
        let karaokeSong

        const exec = async () => {
            return await request(server)
                .put('/api/guests/' + id + '/rsvp')
                .send({
                    email,
                    attending,
                    plusses,
                    dietaryRestrictions,
                    karaokeSong
                })
        }

        beforeEach(async () => {
            const guest = new Guest({
                lastName: 'straw',
                firstName: 'jack'
            })
            await guest.save()

            id = guest._id
            email = 'a@b.c'
            attending = true
            plusses = 1
            dietaryRestrictions = 'string'
            karaokeSong = 'song'
        })

        afterEach(async () => {
            await Guest.deleteMany({})
        })

        it('should update guest if rsvp is valid', async () => {
            await exec()

            const updatedGuest = await Guest.findById(id)

            expect(updatedGuest.email).toBe('a@b.c')
            expect(updatedGuest.attending).toBe(true)
            expect(updatedGuest.plusses).toBe(1)
            expect(updatedGuest.dietaryRestrictions).toBe('string')
            expect(updatedGuest.karaokeSong).toBe('song')
        })

        it('should return updated guest if rsvp is valid', async () => {
            const res = await exec()

            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('email', 'a@b.c')
            expect(res.body).toHaveProperty('attending', true)
            expect(res.body).toHaveProperty('plusses', 1)
            expect(res.body).toHaveProperty('dietaryRestrictions', 'string')
            expect(res.body).toHaveProperty('karaokeSong', 'song')
        })
        
        it('should return 400 if id doesnt match', async () => {
            id = mongoose.Types.ObjectId()
            const res = await exec()

            expect(res.status).toBe(400)
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
                firstName: 'firstName'
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

        it('should delete the guest if input is valid', async () => {
            await exec()

            const guestInDb = await Guest.findById(id)

            expect(guestInDb).toBeNull()
        })

        it('should return the removed guest', async () => {
            const res = await exec()

            console.log(`NAME:: ${guest.name}`)

            expect(res.body).toHaveProperty('_id', guest._id.toHexString())
            expect(res.body).toHaveProperty('lastName', guest.lastName)
            expect(res.body).toHaveProperty('firstName', guest.firstName)
        })
    })
})