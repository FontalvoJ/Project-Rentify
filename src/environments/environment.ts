export const environment = {

    production: false,
    api: {
        baseUrl: 'http://localhost:3030/api'
    },

    vehicleConfig: {
        systems: [
            { _id: '687c1f45c5895bf772dfdf0c', type: 'Gasolina' },
            { _id: '687c1f45c5895bf772dfdf0e', type: 'Electrónico' },
            { _id: '687c1f45c5895bf772dfdf0f', type: 'Diesel' },
            { _id: '687c1f45c5895bf772dfdf0d', type: 'Híbrido' }
        ],
        companions: [
            { _id: '687c1f45c5895bf772dfdefe', amount: 2 },
            { _id: '687c1f45c5895bf772dfdeff', amount: 4 },
            { _id: '687c1f45c5895bf772dfdf00', amount: 5 },
            { _id: '687c1f45c5895bf772dfdf01', amount: 7 }
        ],

        isAvailable: [
            { _id: '69d030a14d1e6f14eac873f1', status: 'Disponible' },
            { _id: '69d030a14d1e6f14eac873f3', status: 'Reservado' },
            { _id: '69d030a14d1e6f14eac873f2', status: 'No Disponible' },
            { _id: '69d030a14d1e6f14eac873f4', status: 'En Mantenimiento' }
        ]
    },

};

