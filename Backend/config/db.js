import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options = {
      // Remove deprecated options and use modern connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('MONGODB_URI')) {
      console.error('\n⚠️  Please create a .env file with MONGODB_URI');
      console.error('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n⚠️  MongoDB authentication failed. Check your username and password.\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n⚠️  Cannot reach MongoDB server. Check your connection string and network.\n');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('\n⚠️  SSL/TLS connection error. This might be a network or firewall issue.\n');
      console.error('Try checking:');
      console.error('1. Your MongoDB Atlas connection string is correct');
      console.error('2. Your IP is whitelisted in MongoDB Atlas');
      console.error('3. Your network allows MongoDB connections\n');
    }
    
    process.exit(1);
  }
};

export default connectDB;
