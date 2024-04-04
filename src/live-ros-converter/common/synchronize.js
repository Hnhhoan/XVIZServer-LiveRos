var _math = require("math.gl");
import * as THREE from 'three';
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");
var turf = _interopRequireWildcard(require("@turf/turf"));
export function getPose(gpsData,imuData,offset){
    offset={
        longitude:offset&&offset.longitude?offset.longitude:0,
        latitude:offset&&offset.latitude?offset.latitude:0,
        latitude:offset&&offset.latitude?offset.latitude:0,
        roll:offset&&offset.roll?offset.roll:0,
        pitch:offset&&offset.pitch?offset.pitch:0,
        yaw:offset&&offset.yaw?offset.yaw:0
    }
    const {longitude,latitude,altitude}=gpsData;
    let {x,y,z,w}= imuData.orientation;
    const nor=Math.sqrt(x*x+y*y+z*z+w*w);
    const quaternion = new THREE.Quaternion(x/nor,y/nor,z/nor,w/nor );
    let euler = new THREE.Euler( 0, 0, 0, 'XYZ' );
    euler.setFromQuaternion(quaternion);
    const roll=euler.x;
    const pitch=euler.y;
    const yaw=euler.z;
    return {
        longitude:longitude+offset.longitude,
        latitude:latitude+offset.latitude,
        altitude:altitude+offset.altitude,
        roll:roll+offset.roll,
        pitch:pitch+offset.pitch,
        yaw:yaw+offset.yaw,
        timestamp:gpsData.header.stamp.secs+gpsData.header.stamp.nsecs*Math.pow(10,-9)};
  }

function getRelativeOffset(pose,n_pose){
    var offset = getGeospatialVector(pose, n_pose);
    var worldToStartPoseTransformMatrix = new _math._Pose(pose).getTransformationMatrix().invert();
    var relativeOffset = worldToStartPoseTransformMatrix.transform(offset);
    return relativeOffset;
  }
function getGeospatialVector(from, to) {
    from = {
        longitude: from.longitude || 0,
        latitude: from.latitude || 0,
        altitude: from.altitude || 0,
        x: from.x || 0,
        y: from.y || 0,
        z: from.z || 0,
        yaw: from.yaw || 0
    };
    to = {
        longitude: to.longitude || 0,
        latitude: to.latitude || 0,
        altitude: to.altitude || 0,
        x: to.x || 0,
        y: to.y || 0,
        z: to.z || 0,
        yaw: to.yaw || 0
    };
    var fromPoint = turf.destination([from.longitude, from.latitude, from.altitude], Math.sqrt(from.x * from.x + from.y * from.y), Math.PI / 2 - from.yaw, {
        units: 'meters'
    });
    var toPoint = turf.destination([to.longitude, to.latitude, to.altitude], Math.sqrt(to.x * to.x + to.y * to.y), Math.PI / 2 - to.yaw, {
        units: 'meters'
    });
    var distInMeters = turf.distance(fromPoint, toPoint, {
        units: 'meters'
    });
    var bearing = turf.bearing(fromPoint, toPoint);
    var bearingInRadians = turf.degreesToRadians(bearing);
    var diffZ = to.altitude + to.z - from.altitude - from.z;
    return [distInMeters * Math.sin(bearingInRadians), distInMeters * Math.cos(bearingInRadians), diffZ];
}
function getRotatedMaxtrix(roll, pitch, yaw){
    const row_0 = [
        Math.cos(pitch) * Math.cos(yaw),
        Math.sin(roll) * Math.sin(pitch) * Math.cos(yaw) - Math.cos(roll) * Math.sin(yaw),
        Math.cos(roll) * Math.sin(pitch) * Math.cos(yaw) + Math.sin(roll) * Math.sin(yaw)];

    const row_1 = [
        Math.cos(pitch) * Math.sin(yaw),
        Math.sin(roll) * Math.sin(pitch) * Math.sin(yaw) + Math.cos(roll) * Math.cos(yaw),
        Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw) - Math.sin(roll) * Math.cos(yaw)];
    const row_2 = [
        -Math.sin(pitch),
        Math.sin(roll) * Math.cos(pitch),
        Math.cos(roll) * Math.cos(pitch)];
    return [row_0, row_1, row_2]; // Direction Cosine Matrix
}
function rotationBasedOnRollPitchYaw(DCM, point){
    let rotatedPoint = [];
    for (var i = 0; i < DCM.length; i++) {
        let e = 0;
        for (var j = 0; j < DCM[i].length; j++) {
            e += point[j] * DCM[i][j];
        }
        rotatedPoint.push(e);
    }
    return { x: rotatedPoint[0], y: rotatedPoint[1], z: rotatedPoint[2] };
}

/*function rotationBasedOnRollPitchYaw(roll, pitch, yaw, point) {
    const row_0 = [
        Math.cos(pitch) * Math.cos(yaw),
        Math.sin(roll) * Math.sin(pitch) * Math.cos(yaw) - Math.cos(roll) * Math.sin(yaw),
        Math.cos(roll) * Math.sin(pitch) * Math.cos(yaw) + Math.sin(roll) * Math.sin(yaw)];

    const row_1 = [
        Math.cos(pitch) * Math.sin(yaw),
        Math.sin(roll) * Math.sin(pitch) * Math.sin(yaw) + Math.cos(roll) * Math.cos(yaw),
        Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw) - Math.sin(roll) * Math.cos(yaw)];
    const row_2 = [
        -Math.sin(pitch),
        Math.sin(roll) * Math.cos(pitch),
        Math.cos(roll) * Math.cos(pitch)];
    const DCM = [row_0, row_1, row_2]; // Direction Cosine Matrix
    let rotatedPoint = [];
    for (var i = 0; i < DCM.length; i++) {
        let e = 0;
        for (var j = 0; j < DCM[i].length; j++) {
            e += point[j] * DCM[i][j];
        }
        rotatedPoint.push(e);
    }
    return { x: rotatedPoint[0], y: rotatedPoint[1], z: rotatedPoint[2] };
}*/

export function synchronizeCoordinate(pose,n_pose,n_points,offset){
    offset=offset?offset:[0,0,0];
    const syn_points=[];
    const relativeOffset=getRelativeOffset(pose,n_pose);
    const roll = (n_pose.roll - pose.roll);
    const pitch = (n_pose.pitch - pose.pitch);
    const yaw = (n_pose.yaw - pose.yaw);
    const DCM=getRotatedMaxtrix(roll, pitch, yaw);
    for (let i = 0; i < n_points.length/3; i++) {
        const point=[n_points[i * 3 + 0],n_points[i * 3 + 1],n_points[i * 3 + 2]];
        const {x,y,z}=rotationBasedOnRollPitchYaw(DCM, point);    
        //syn_points.push([x+offset[0]+relativeOffset[0],y+offset[1]+relativeOffset[1],z+offset[2]+relativeOffset[2]])
        syn_points.push(x+offset[0]+relativeOffset[0]);
        syn_points.push(y+offset[1]+relativeOffset[1]);
        syn_points.push(z+offset[2]+relativeOffset[2]);
      }
    return syn_points ;
}