

let mongoose = require('mongoose');

let mongoDB = `mongodb://127.0.0.1:27017/store`;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          });
      
          console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = { connectDB };