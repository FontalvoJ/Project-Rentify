export const environment = {

    production: true,
    api: {
        baseUrl: 'https://api-backend-rentify.onrender.com/api'
    },

    vehicleConfig: {
        systems: [
            { _id: '69ae3dde5c6b4ff7545a2516', type: 'Gasolina' },
            { _id: '69ae3dde5c6b4ff7545a2518', type: 'Electrónico' },
            { _id: '69ae3dde5c6b4ff7545a2519', type: 'Diesel' },
            { _id: '69ae3dde5c6b4ff7545a2517', type: 'Híbrido' }
        ],
        companions: [
            { _id: '69ae3dde5c6b4ff7545a2508', amount: 2 },
            { _id: '69ae3dde5c6b4ff7545a2509', amount: 4 },
            { _id: '69ae3dde5c6b4ff7545a250a', amount: 5 },
            { _id: '69ae3dde5c6b4ff7545a250b', amount: 7 }
        ]
    }
};