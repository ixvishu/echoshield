const fs = require('fs');
const content = fs.readFileSync('dashboard.html', 'utf-8');
const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (match) {
    fs.writeFileSync('test.jsx', match[1]);
    console.log('JSX extracted to test.jsx');
} else {
    console.log('No babel script found');
}
