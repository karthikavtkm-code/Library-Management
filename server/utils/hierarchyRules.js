const HIERARCHY_RULES = {
    'Library': ['Section', 'Library Operations', 'User Services'],
    'Section': ['Shelf', 'Reference Unit', 'Periodicals Unit', 'Digital Resources'],
    'Shelf': ['Category', 'Book Format'],
    'Reference Unit': [],
    'Periodicals Unit': [],
    'Digital Resources': [],
    'Category': [],
    'Book Format': [],
    'Library Operations': [
        'Issue & Return Desk',
        'Membership Management',
        'Fine Management',
        'Inventory Control'
    ],
    'User Services': [
        'Reading Rooms',
        'Reservation System',
        'Help Desk'
    ],
    'Issue & Return Desk': [],
    'Membership Management': [],
    'Fine Management': [],
    'Inventory Control': [],
    'Reading Rooms': [],
    'Reservation System': [],
    'Help Desk': []
};

module.exports = HIERARCHY_RULES;
