const Activity = require('../models/Activity');
const Score = require('../models/Score');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total practice sessions
    const practiceCount = await Activity.countDocuments({
      user: userId,
      activityType: 'practice'
    });

    // Get total interviews
    const interviewCount = await Activity.countDocuments({
      user: userId,
      activityType: 'interview'
    });

    // Get total resume uploads
    const resumeCount = await Activity.countDocuments({
      user: userId,
      activityType: 'resume'
    });

    // Get average scores
    const scores = await Score.find({ user: userId });
    const avgPracticeScore = scores.reduce((acc, curr) => acc + (curr.practiceScore || 0), 0) / scores.length || 0;
    const avgInterviewScore = scores.reduce((acc, curr) => acc + (curr.interviewScore || 0), 0) / scores.length || 0;

    res.json({
      stats: {
        practiceSessions: practiceCount,
        interviews: interviewCount,
        resumeUploads: resumeCount,
        avgPracticeScore: Math.round(avgPracticeScore),
        avgInterviewScore: Math.round(avgInterviewScore)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get weekly activity
exports.getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const activities = await Activity.find({
      user: userId,
      date: { $gte: oneWeekAgo }
    }).sort({ date: -1 });

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get accuracy rates
exports.getAccuracyRates = async (req, res) => {
  try {
    const userId = req.user.id;
    const scores = await Score.find({ user: userId }).sort({ date: -1 }).limit(10);

    const accuracyRates = scores.map(score => ({
      practice: score.practiceScore || 0,
      interview: score.interviewScore || 0,
      date: score.date
    }));

    res.json({ accuracyRates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get score over time
exports.getScoreOverTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const scores = await Score.find({ user: userId }).sort({ date: 1 });

    const scoreData = scores.map(score => ({
      practice: score.practiceScore || 0,
      interview: score.interviewScore || 0,
      date: score.date
    }));

    res.json({ scoreData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await Activity.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 