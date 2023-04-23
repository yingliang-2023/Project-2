const request=require('supertest');
const app=require('./app.js');

describe (`home page renders welcome`, () => {
    it("Returns welcome"), async done=> {
    await request(app).get('/').expect(200).then((response) => {
        expect(response.body.home_title).toBe('Welcome');
    });
    done();
}
});
