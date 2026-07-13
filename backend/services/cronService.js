const cron = require('node-cron');
const Appointment = require('../model/Appointment');
const { sendAppointmentReminder } = require('./emailService');

const parseAppointmentTime = (date, timeStr) => {
    const parsedDate = new Date(date);
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return parsedDate;

    let [, hours, minutes, ampm] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (ampm) {
        ampm = ampm.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
    }

    parsedDate.setHours(hours, minutes, 0, 0);
    return parsedDate;
};

const processReminders = async () => {
    try {
        console.log('[Cron] Checking for upcoming and past appointments...');
        const now = new Date();
        
        // Find approved appointments that haven't had all reminders sent
        // We also want completed appointments for the post4hr survey
        const appointments = await Appointment.find({
            status: { $in: ['Approved', 'Completed'] }
        }).populate('patient').populate('doctor');

        for (const appt of appointments) {
            // Skip if patient or doctor missing
            if (!appt.patient || !appt.doctor) continue;

            const apptTime = parseAppointmentTime(appt.date, appt.timeSlot);
            const diffHours = (apptTime - now) / (1000 * 60 * 60);

            // 1. Check 24-hour reminder (diff between 23 and 25 hours)
            if (appt.status === 'Approved' && diffHours <= 25 && diffHours > 0 && !appt.remindersSent.includes('24hr')) {
                await sendAppointmentReminder(appt.patient, appt.doctor, appt, '24hr');
                appt.remindersSent.push('24hr');
                await appt.save();
            }

            // 2. Check 5-hour reminder (diff between 0 and 6 hours)
            if (appt.status === 'Approved' && diffHours <= 6 && diffHours > 0 && !appt.remindersSent.includes('5hr')) {
                await sendAppointmentReminder(appt.patient, appt.doctor, appt, '5hr');
                appt.remindersSent.push('5hr');
                await appt.save();
            }

            // 3. Check Post-4-hour follow-up (diff between -4 and -6 hours)
            if (diffHours <= -4 && diffHours > -24 && !appt.remindersSent.includes('post4hr')) {
                await sendAppointmentReminder(appt.patient, appt.doctor, appt, 'post4hr');
                appt.remindersSent.push('post4hr');
                await appt.save();
            }
        }
    } catch (error) {
        console.error('[Cron Error] Failed to process reminders:', error);
    }
};

const initCronJobs = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        processReminders();
    });
    console.log('Cron jobs initialized.');
};

module.exports = { initCronJobs };
