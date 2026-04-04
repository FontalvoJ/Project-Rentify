export const environment = {

    production: true,
    api: {
        baseUrl: 'https://api-backend-rentify.onrender.com/api'
    },

    vehicleConfig: {
        systems: [
            { _id: '69d0a75a4956ff5c0011a2da', type: 'Gasolina' },
            { _id: '69d0a75a4956ff5c0011a2dc', type: 'Electrónico' },
            { _id: '69d0a75a4956ff5c0011a2dd', type: 'Diesel' },
            { _id: '69d0a75a4956ff5c0011a2db', type: 'Híbrido' }
        ],
        companions: [
            { _id: '69d0a7594956ff5c0011a2c8', amount: 2 },
            { _id: '69d0a7594956ff5c0011a2c9', amount: 4 },
            { _id: '69d0a7594956ff5c0011a2ca', amount: 5 },
            { _id: '69d0a7594956ff5c0011a2cb', amount: 7 }
        ],

        isAvailable: [
            { _id: '69d0a75a4956ff5c0011a2d1', status: 'Disponible' },
            { _id: '69d0a75a4956ff5c0011a2d3', status: 'Reservado' },
            { _id: '69d0a75a4956ff5c0011a2d2', status: 'No Disponible' },
            { _id: '69d0a75a4956ff5c0011a2d4', status: 'En Mantenimiento' }
        ]
    }

};