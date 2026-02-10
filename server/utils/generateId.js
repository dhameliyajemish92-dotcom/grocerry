const generateId = () => {
    // Generate a more unique ID: timestamp + random digits
    const timestamp = Date.now().toString().slice(-6);  // Last 6 digits of timestamp
    let random = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        random += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${timestamp}${random}`;  // 12-digit ID
}

export default generateId;