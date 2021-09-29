/**
 * Seeds projects collection, add default 'Quick start' project
 */

const quickStartProject = {
    name: 'Quick Start',
    gateway: {
        port: 3569,
        network: '127.0.0.1',
        address: "f8d6e0586b0a20c7",
        key: "feacb599c6070f0a5d32ff834d57467f83646908a68c17a1fb7aad918db873d2"
    }
};

try {
    db.projects.insertOne(quickStartProject);
} catch (e) {
    console.error('Can not seed projects collection');
}
