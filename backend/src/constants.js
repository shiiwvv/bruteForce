export const DB_NAME = "bruteForce";
import crypto from "crypto";

const isProd = process.env.NODE_ENV === "production";

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

export const customMessages = (username, problemCount) => {
  const message = [
    `👀 Psst ${username}... remember these problem?
    
    You marked ${problemCount} problems for today because apparently *future you* was supposed to deal with it. 😂
    
    Well, future you has arrived.
    
    Go solve it. 🫡💻`,

    `${username}, Your ${problemCount} DSA problems has been waiting patiently...
    
    You told yourself you'd revisit ${problemCount === 1 ? `it` : `them`} today.
    Your past self remembers. Your code remembers. 😶
    
    Now go show that problem who's boss. 😎💻`,

    `🧠 Time to revisit!
    
    You marked ${problemCount} DSA problems for today.
    No excuses ${username}— just one problem, one pattern, one step closer. 🚀
    
    Happy solving! 💻
    `,
    `🚨 DSA is calling!
    
    Remember the ${problemCount} problems you marked to revisit today? 👀
    Yep, *${problemCount === 1 ? "that one" : "those ones"}*.
    
    Time to dust off the logic, crack the pattern, and make your future self proud. 💪🧠
    
    Go get it! 🚀
    `,
  ];

  return message;
};

export const customSubjects = (username, problemCount) => {
  const subjects = [
    `👀 Psst ${username}... Your DSA ${problemCount === 1 ? "Problem is" : "Problems are"} Waiting`,
    `🚨 Your DSA ${problemCount === 1 ? "Problem is" : "Problems are"} Calling`,
    `👀 You Asked Us to Remind You...`,
    `😏 Remember What You Promised Yourself?`,
    `👀 Remember ${problemCount === 1 ? "This Problem" : "These Problems"}?`,
    `🚀 Time to Revisit & Conquer`,
  ];

  return subjects;
};

export const DEFAULT_AVATAR = {
  url: "https://res.cloudinary.com/gkmpenrb/image/upload/v1791655307/a1eofg0ik5w202ruz1ci.webp",
  public_id: "a1eofg0ik5w202ruz1ci",
};

export const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

export const welcomeText = (username) => {
  return `Hi, ${username}

Welcome to BruteForce.com! 🎉

Your account has been created successfully, and you're all set to start your journey of becoming a better problem solver.

Whether you're practicing DSA, tracking your progress, or sharpening your algorithmic thinking, we're here to help you stay consistent and keep improving.

Your account is now ready. Let the solving begin! 💻🔥

Keep learning. Keep solving. Keep growing.

Team BruteForce.com`;
};


export const welcomeTextViaOAuth = (username, method) => {
  return `Hi ${username},

Welcome to BruteForce.com! 🎉

You're all set to start your journey toward becoming a better problem solver. Whether you're practicing DSA, tracking your progress, or sharpening your algorithmic thinking, we're here to help you stay consistent and keep improving.

Your account was created using ${method} authentication. If you'd like to log in directly using your email and password in the future, please update your username and set a password from your account settings.

Your account is now ready. Let the solving begin! 💻🔥

Keep learning. Keep solving. Keep growing.

Team BruteForce.com`;
};

