const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 80;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const orderId = req.body.queryResult.parameters.orderId;

    console.log(`Received order ID: ${orderId}`);

    try {
        const response = await axios.post('https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus', { orderId });
        const shipmentDate = response.data.shipmentDate;

        if (!shipmentDate) {
            throw new Error('Shipment date not found');
        }

        console.log(`Shipment date received: ${shipmentDate}`);

        const shipmentDateObj = new Date(shipmentDate);
        const formattedDate = shipmentDateObj.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
        });

        console.log(`Formatted shipment date: ${formattedDate}`);

        // Send response to Dialogflow including the audio URL
        res.json({
            fulfillmentMessages: [
                {
                    text: {
                        text: [
                            `Your order with ID ${orderId} will be shipped on ${formattedDate}.`
                        ]
                    }
                },
                {
                    text: {
                        text: [
                            `You're welcome.`
                        ]
                    }
                },
                {
                    payload: {
                        audio: {
                            url: 'https://example.com/path/to/your/audio.mp3' // Replace with your actual audio URL
                        }
                    }
                }
            ]
        });

    } catch (error) {
        console.error('Error fetching order status:', error.response?.data || error.message);

        const errorMessage = error.response && error.response.status === 400
            ? 'Please provide a valid order ID'
            : 'Sorry, there was an error retrieving your order status.';

        res.json({
            fulfillmentMessages: [
                {
                    text: {
                        text: [
                            errorMessage
                        ]
                    }
                }
            ]
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
