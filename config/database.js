const mongoose = require('mongoose');

const dbconnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        });

        console.log(' mongoDB connected');
    } catch (err) {
        console.log(err)
        /* console.error(`Error: ${error.message}`)
        process.exit(1)
        */
    }
}

module.exports = dbconnect;