import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";

dotenv.config();

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    console.log(user);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const todaysWorkouts = await Workout.find({
      userId: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString } = req.body;

    // Check if the workout string is provided
    if (!workoutString) {
      return res.status(400).json({ message: "Workout string is missing" });
    }

    console.log('Received workoutString:', workoutString); // Debug log

    // Split workoutString into individual lines, remove empty lines, and trim each line
    const eachworkout = workoutString.split("\n").map((line) => line.trim()).filter(line => line);
    console.log('Parsed workout lines:', eachworkout); // Debug log

    // Initialize an array to hold parsed workouts
    const parsedWorkouts = [];
    let currentCategory = "";
    let count = 0;

    // Loop through each line to parse workout details
    for (const line of eachworkout) {
      count++;
      console.log('Processing line:', line); // Debug log

      // Check for categories (lines starting with "#")
      if (line.startsWith("#")) {
        // Update the current category based on the line
        currentCategory = line.substring(1).trim(); // Remove "#" and trim spaces
        console.log('Current Category:', currentCategory); // Debug log

      } else {
        // If no category is set yet, we cannot proceed with workout details
        if (!currentCategory) {
          return res.status(400).json({ message: `Category is missing for the ${count}th workout` });
        }

        // Parse the workout details from the line
        const workoutDetails = parseWorkoutLine(line); // Call your function to parse the details
        
        if (!workoutDetails) {
          return res.status(400).json({ message: `Invalid format for workout line at ${count}` });
        }

        // Add category to workout details and push to parsed workouts array
        workoutDetails.category = currentCategory;
        workoutDetails.user = userId; // Add the user ID to the workout
        parsedWorkouts.push(workoutDetails);
      }
    }

    console.log('Parsed Workouts:', parsedWorkouts); // Debug log

    // Now, calculate calories for each workout and save to the database
    const workoutsToCreate = parsedWorkouts.map(async (workout) => {
      try {
        // Calculate calories burned (replace with actual logic)
        workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout)); // Ensure calculateCaloriesBurnt is working correctly
        // Save to database
        const newWorkout = await Workout.create({ ...workout });
        console.log('Workout created:', newWorkout); // Debug log for created workout
      } catch (dbError) {
        console.error('Error creating workout in database:', dbError); // Log database error
        throw new Error('Error saving workout to database');
      }
    });

    // Wait for all workout creations to complete
    await Promise.all(workoutsToCreate);

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: parsedWorkouts,
    });

  } catch (err) {
    console.error('Internal Server Error:', err); // Log any unexpected errors
    return res.status(500).json({ message: "An error occurred", error: err.message });
  }
};

// Dummy example of the `parseWorkoutLine` function
function parseWorkoutLine(line) {
  // Here, you need to extract the actual workout details from the line
  // Example: parsing numbers, weights, or times from the line
  const parts = line.split("-").map(part => part.trim()).filter(part => part); // Split on dash and clean up

  // Ensure there's at least one detail
  if (parts.length < 1) return null;

  // Example: Return a basic workout object with a name and details (you can extend this logic based on your actual input format)
  return {
    workoutName: parts[0], // Workout name or type
    sets: parts[1] ? parseInt(parts[1]) : null, // Example, parse sets (adjust based on actual format)
    reps: parts[2] ? parseInt(parts[2]) : null, // Parse reps
    weight: parts[3] ? parseFloat(parts[3]) : null, // Parse weight (ensure correct unit handling)
    duration: parts[4] ? parseInt(parts[4]) : null, // Parse duration (time)
  };
}



// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const durationInMinutes = parseInt(workoutDetails.duration);
  const weightInKg = parseInt(workoutDetails.weight);
  const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
  return durationInMinutes * caloriesBurntPerMinute * weightInKg;
};
