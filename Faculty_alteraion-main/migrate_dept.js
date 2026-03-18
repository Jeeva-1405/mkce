const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'profiles.json');

if (fs.existsSync(filePath)) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let updatedCount = 0;

        for (const id in data) {
            // Check for previous variants to ensure all are updated to "ECE"
            if (data[id].dept === "Electronics and Communication Engineering" || data[id].dept === "Electronics (ECE)") {
                data[id].dept = "ECE";
                updatedCount++;
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully updated ${updatedCount} profiles to "ECE".`);
    } catch (err) {
        console.error('Error updating profiles.json:', err);
    }
} else {
    console.log('profiles.json not found.');
}
