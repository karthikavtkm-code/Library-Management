const db = require('../config/db');
const HIERARCHY_RULES = require('../utils/hierarchyRules');

exports.createNode = async (req, res) => {
    try {
        const { name, type, parent_id } = req.body;
        const created_by = req.user.id;
        const { role, assigned_node_id } = req.user;

        // Permission Rule: A parent node (user assigned to a node) can only create direct children.
        if (role !== 'admin' && assigned_node_id) {
            if (!parent_id || parseInt(parent_id) !== parseInt(assigned_node_id)) {
                return res.status(403).json({
                    message: `Permission denied: You can only create direct child nodes of your assigned node (ID: ${assigned_node_id}).`
                });
            }
        }

        // If parent_id is provided, validate hierarchy
        if (parent_id) {
            const [parents] = await db.query('SELECT type FROM library_nodes WHERE id = ?', [parent_id]);
            if (parents.length === 0) {
                return res.status(400).json({ message: 'Parent node not found' });
            }
            const parentType = parents[0].type;
            const allowedChildren = HIERARCHY_RULES[parentType] || [];

            if (!allowedChildren.includes(type)) {
                return res.status(400).json({
                    message: `Invalid hierarchy: ${parentType} cannot have child of type ${type}. Allowed: ${allowedChildren.join(', ')}`
                });
            }
        } else {
            // Only Library can be a root node if we want to be strict, 
            // but the rules say Library creates Sections, etc. 
            // So Library must be created first without a parent.
            if (type !== 'Library') {
                return res.status(400).json({ message: 'Only "Library" can be a root node' });
            }
        }

        const [result] = await db.query(
            'INSERT INTO library_nodes (name, type, parent_id, created_by) VALUES (?, ?, ?, ?)',
            [name, type, parent_id || null, created_by]
        );

        res.status(201).json({ id: result.insertId, name, type, parent_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getHierarchy = async (req, res) => {
    try {
        const { role, assigned_node_id } = req.user;
        const [nodes] = await db.query('SELECT * FROM library_nodes');

        const buildTree = (parentId = null) => {
            return nodes
                .filter(node => node.parent_id === parentId)
                .map(node => ({
                    ...node,
                    children: buildTree(node.id)
                }));
        };

        let tree;

        // Permission Rule: A parent node can view the complete hierarchy BENEATH them.
        if (role !== 'admin' && assigned_node_id) {
            // Find the assigned node to serve as root
            const rootNode = nodes.find(n => n.id === assigned_node_id);
            if (!rootNode) {
                // If assigned node doesn't exist (deleted?), fallback or empty
                return res.status(404).json({ message: 'Assigned node context not found.' });
            }
            // Build children for the assigned node
            rootNode.children = buildTree(rootNode.id);
            // Return as an array containing the root (to maintain consistency with list format)
            tree = [rootNode];
        } else {
            // Admin or no assignment sees full tree (roots have parent_id = null)
            tree = buildTree(null);
        }

        res.json(tree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNode = async (req, res) => {
    try {
        const { id } = req.params;
        const [nodes] = await db.query('SELECT * FROM library_nodes WHERE id = ?', [id]);
        if (nodes.length === 0) {
            return res.status(404).json({ message: 'Node not found' });
        }

        const node = nodes[0];

        // Fetch children
        const [children] = await db.query('SELECT * FROM library_nodes WHERE parent_id = ? ORDER BY name ASC', [id]);
        node.children = children;

        res.json(node);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateNode = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        await db.query('UPDATE library_nodes SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Node updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteNode = async (req, res) => {
    try {
        const { id } = req.params;
        // ON DELETE CASCADE takes care of children
        await db.query('DELETE FROM library_nodes WHERE id = ?', [id]);
        res.json({ message: 'Node and its children deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
