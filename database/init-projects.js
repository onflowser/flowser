/**
 * Seeds projects collection, add default 'Quick start' project
 */
try {
    // TODO: Add project data
    db.projects.insertOne({name: "Quick start", configuration: {}});
} catch (e) {
    console.error('Can not seed projects collection');
}
