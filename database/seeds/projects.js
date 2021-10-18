/**
 * Seeds projects collection, add default 'Quick start' project
 */

const quickStartProject = [
    {
        id: "emulator",
        name: 'Emulator',
        gateway: {
            port: 8080,
            address: 'http://host.docker.internal',
        },
        emulator: {
            verboseLogging: true,
            httpServerPort: 8080,
            persist: false
        }
    }
];

try {
    db.projects.insertMany(quickStartProject);
} catch (e) {
    console.error('Can not seed projects collection');
}
