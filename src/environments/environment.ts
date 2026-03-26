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
        ]
    }

};

