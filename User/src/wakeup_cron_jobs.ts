import axios from "axios";

const API_KEY = process.env.API_KEY;

const cron = require("node-cron");

// Define your cron job schedule
export const job = cron.schedule("*/15 8-23 * * *", async () => {
  console.log("Running cron job...");

  const usersRes = await axios.get(
    "https://events-system-users.onrender.com/wakeup"
  );
  const eventRes = await axios.get(
    "https://events-system-event.onrender.com/wakeup",
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  const paymentRes = await axios.get(
    "https://events-system-payment.onrender.com/wakeup",
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  const commentsRes = await axios.get(
    "https://events-system-comments.onrender.com/wakeup",
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  const orderRes = await axios.get(
    "https://events-system-order.onrender.com/wakeup",
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  if (usersRes.status === 200) {
    console.log("Users service woke up successfully");
  } else {
    console.log("Users service failed to wake up");
  }

  if (eventRes.status === 200) {
    console.log("Event service woke up successfully");
  } else {
    console.log("Event service failed to wake up");
  }

  if (paymentRes.status === 200) {
    console.log("Payment service woke up successfully");
  } else {
    console.log("Payment service failed to wake up");
  }

  if (commentsRes.status === 200) {
    console.log("Comments service woke up successfully");
  } else {
    console.log("Comments service failed to wake up");
  }

  if (orderRes.status === 200) {
    console.log("Order service woke up successfully");
  } else {
    console.log("Order service failed to wake up");
  }

  console.log("Cron job finished");
});

// Start the cron job
// job.start();
