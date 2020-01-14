const cropSchema = {
    name: 'Crop',


    properties: {

        image_uri: 'string',
        image_type: 'string',
        classify: { type: 'string', default: 'Not classified' },
        lat: { type: 'string', optional: true },
        lon: { type: 'string', optional: true },
        data_added: 'date', 

    }
}

export default cropSchema