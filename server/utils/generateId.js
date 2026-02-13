const generateId = () => {
    // Generate a 6-character alphanumeric ID (e.g., ABC123)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 3; i++) {
        result += characters.charAt(Math.floor(Math.random() * 26)); // 3 uppercase letters
    }
    for (let i = 0; i < 3; i++) {
        result += characters.charAt(26 + Math.floor(Math.random() * 10)); // 3 digits
    }
    return result; // 6-character ID like ABC123
}

export default generateId;
