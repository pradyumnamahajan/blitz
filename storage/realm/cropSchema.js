const cropSchema = {
    name: 'Crop',


    properties: {

        image_uri: 'string',
        classify: { type: 'string', default: 'Not classified' },
        lat: { type: 'string', optional: true },
        lon: { type: 'string', optional: true },
        data_added: 'date', //also may have time added dunno

    }
}

export default cropSchema