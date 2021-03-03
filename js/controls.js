ispy.resetControls = function () {

    ispy.initCamera();
    ispy.controls.reset();

};

ispy.setXY = function () {
    var length = ispy.camera.position.length();
    ispy.camera.position.x = 0;
    ispy.camera.position.y = 0;
    ispy.camera.position.z = length;
    ispy.camera.up = new THREE.Vector3(0, 1, 0);
    ispy.lookAtOrigin();
};

ispy.setZX = function () {
    var length = ispy.camera.position.length();
    ispy.camera.position.x = 0;
    ispy.camera.position.y = length;
    ispy.camera.position.z = 0;
    ispy.camera.up = new THREE.Vector3(1, 0, 0);
    ispy.lookAtOrigin();
};

ispy.setYZ = function () {
    var length = ispy.camera.position.length();
    ispy.camera.position.x = -length;
    ispy.camera.position.y = 0;
    ispy.camera.position.z = 0;
    ispy.camera.up = new THREE.Vector3(0, 1, 0);
    ispy.lookAtOrigin();
};

ispy.setOrthographic = function () {

    $('#perspective').removeClass('active');
    $('#orthographic').addClass('active');
    $('#stereo').removeClass('active');

    ispy.camera.toOrthographic();

};

ispy.setPerspective = function () {

    $('#perspective').addClass('active');
    $('#orthographic').removeClass('active');
    $('#stereo').removeClass('active');

    ispy.camera.toPerspective();

};

ispy.enterFullscreen = function () {
    var container = document.getElementById('ispy');

    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    } else {
        alert('Cannot go to full screen!');
    }
};

ispy.exitFullscreen = function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else {
        alert('Cannot exit full screen. Try Esc?');
    }
};

ispy.toggleFullscreen = function () {
    $('#enterFullscreen').toggleClass('active');
    $('#exitFullscreen').toggleClass('active');
};

document.addEventListener('webkitfullscreenchange', ispy.toggleFullscreen, false);
document.addEventListener('mozfullscreenchange', ispy.toggleFullscreen, false);
document.addEventListener('fullscreenchange', ispy.toggleFullscreen, false);
document.addEventListener('MSFullscreenChange', ispy.toggleFullscreen, false);

ispy.reload = function () {
    location.reload();
};

ispy.toStereo = function () {

    if (!ispy.stereo) {

        ispy.stereo = true;

        ispy.camera.position.x = 5;
        ispy.camera.position.y = 5;
        ispy.camera.position.z = 10;

        ispy.stereo_renderer = new THREE.StereoEffect(ispy.renderer);
        ispy.do_controls = new THREE.DeviceOrientationControls(ispy.camera);

        $('#axes').hide();
        $('#event-info').hide();

        $('#display')[0].addEventListener('click', ispy.toStereo, false);

        ispy.do_controls.connect();

        ispy.onWindowResize();

    } else {

        ispy.stereo = false;

        $('#axes').show();
        $('#event-info').show();

        $('#display')[0].removeEventListener('click', ispy.toStereo, false);

        ispy.setPerspective();
        ispy.initCamera();
        ispy.onWindowResize();

    }
}

function setOrientationControls(e) {
    if (!e.alpha) {
        return;
    }

    window.removeEventListener('deviceorientation', setOrientationControls, true);
}

window.addEventListener('deviceorientation', setOrientationControls, true);

ispy.setStereo = function () {

    $('#perspective').removeClass('active');
    $('#orthographic').removeClass('active');

    $('#stereo').addClass('active');

    ispy.toStereo();
    ispy.enterFullscreen();

};

ispy.zoomIn = function () {

    if (ispy.camera.inPerspectiveMode) {
        ispy.camera.position.multiplyScalar(0.5);
    } else {
        var zoom = ispy.camera.zoom;
        ispy.camera.setZoom(zoom + 0.5);
    }
};

ispy.zoomOut = function () {

    if (ispy.camera.inPerspectiveMode) {
        ispy.camera.position.multiplyScalar(1.5);
    } else {
        var zoom = ispy.camera.zoom;
        ispy.camera.setZoom(zoom - 0.5);
    }

};

ispy.printImage = function () {
    ispy.get_image_data = true;
    ispy.render();
    window.open(ispy.image_data, "toDataURL() image", "width=800, height=400");
};

ispy.exportString = function (output, filename) {
    // This comes from three.js editor
    var blob = new Blob([output], {type: 'text/plain'});
    var objectURL = URL.createObjectURL(blob);

    console.log(filename);

    // Use this to output to file:
    var link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = objectURL;
    link.download = filename || 'data.txt';
    link.target = '_blank';
    link.click();

    // Use this to output to tab:
    //window.open(objectURL, '_blank');
    //window.focus();
};

ispy.exportScene = function () {
    // The scene is actually made up of several objects,
    // one each for major category: e.g. Detector, ECAL, Physics, etc.
    // This exports a json file for each whether visible or not.
    ispy.scene.children.forEach(function (c) {
        var output = c.toJSON();
        output = JSON.stringify(output, null, '\t');
        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
        ispy.exportString(output, c.name + '.json');
    });
};

ispy.exportGLTF = function () {

    var exporter = new THREE.GLTFExporter();

    ispy.scene.children.forEach(function (c) {

        if (c.children.length > 0 && c.name !== 'Lights') { // If no children then nothing to export

            c.children.forEach(function (o) {

                if (o.visible) {

                    exporter.parse(o, function (result) {

                        var output = JSON.stringify(result, null, 2);
                        ispy.exportString(output, o.name + '.gltf');

                    });

                }

            });

        }

    });

};

// Parse data as a long string
ispy.parseEventDataAsString = function (key, obj) {
    let props = ispy.current_event.Types[key];
    let eventData = ispy.current_event.Collections[key][obj.userData.originalIndex];
    if (props == null || eventData == null) {
        return "\n# no event data parsable";
    }

    let output = '';

    // compute the distance of the first point to origin (for a track)
    if (obj instanceof THREE.Line) {
        let first_pos = obj.geometry.vertices[0];
        let dist = first_pos.x * first_pos.x + first_pos.y * first_pos.y + first_pos.z * first_pos.z;
        dist = Math.sqrt(dist);
        output += "_double:dist:=" + dist;
    }

    let propCount = props.length;

    for (let i = 0; i < propCount; i++) {
        // The string should be of this format -> _<type1>:<name1>:=<value1>_<type2>:<name2>:=<value2>[...]
        output += "_" + props[i][1] + ":" + props[i][0] + ":=" + eventData[i];
    }

    return output;
};

// Parse data as .obj format line comments
ispy.parseEventDataAsOBJComment = function (key, obj) {
    let props = ispy.current_event.Types[key];
    let eventData = ispy.current_event.Collections[key][obj.userData.originalIndex];
    if (props == null || eventData == null) {
        return "\n# no event data parsable";
    }

    let output = '';
    let propCount = props.length;

    for (let i = 0; i < propCount; i++) {
        // Each line should be of this format -> # <type> : <name> := <value>
        output += "\n# " + props[i][1] + " : " + props[i][0] + " := " + eventData[i];
    }

    return output;
};

const zeroPad = (num, places) => String(num).padStart(places, '0');

ispy.exportModel = function (format) {
    var exporter;

    if (format === 'obj') {
        exporter = new THREE.OBJExporter();
    } else if (format === 'stl') {
        exporter = new THREE.STLExporter();
    }

    let c_names = null;
    let name = null;
    let i = 0;
    ispy.scene.children.forEach(function (c) {
        if (c.children.length > 0 && c.name !== 'Lights') { // If no children then nothing to export

            c.children.forEach(function (o) {
                if (o.visible) {
                    // When exporting each 3D object should have a different name, we make sure of it using an iterator
                    name = o.name;
                    c_names = new Array(o.length);
                    i = 0;
                    o.traverse(function (child) {
                        c_names[i] = child.name;

                        if (child.group >= 0)
                            child.name += '_grp' + zeroPad(child.group, 6);

                        child.name += "_" + zeroPad(i-1, 6);

                        // When exporting in .obj format, we add the data from the current event to the name.
                        // This does increase the size of the exported files but should have no effect on the 3D model.
                        if (format === 'obj' && child.visible) {
                            child.name += ispy.parseEventDataAsString(c_names[i].replaceAll("*",''), child);
                        }
                        i++;
                    });

                    ispy.exportString(exporter.parse(o), name.replaceAll("*",'') + '.' + format);

                    // Reversing the names change since its only necessary when exporting
                    i = 0;
                    o.traverse(function (child) {
                        child.name = c_names[i];
                        i++
                    });
                    c_names = null;
                    name = null;
                }
            });
        }
    });
};
