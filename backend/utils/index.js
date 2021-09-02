const imgArray = [
    'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://t3.ftcdn.net/jpg/02/36/48/86/360_F_236488644_opXVvD367vGJTM2I7xTlsHB58DVbmtxR.jpg',
    'http://shahjis.in/wp-content/uploads/2021/02/sun-spots.jpeg',
    'https://images.pexels.com/photos/2078265/pexels-photo-2078265.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://t3.ftcdn.net/jpg/03/67/46/48/360_F_367464887_f0w1JrL8PddfuH3P2jSPlIGjKU2BI0rn.jpg',
];

const userProfilePic = () => { return imgArray[Math.floor(Math.random() * imgArray.length)]; }

module.exports = { userProfilePic };