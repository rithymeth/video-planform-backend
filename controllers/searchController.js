// controllers/searchController.js
const esClient = require('../utils/elasticsearchClient');

exports.searchContent = async (req, res) => {
  const { query } = req.query; // Get the search query from the request
  try {
    const { body } = await esClient.search({
      index: 'videos', // Specify the index to search (adjust this based on your use case)
      body: {
        query: {
          match: { title: query }, // Search for the query in the "title" field
        },
      },
    });

    res.json(body.hits.hits); // Return search results
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    res.status(500).json({ error: 'Search error' });
  }
};
