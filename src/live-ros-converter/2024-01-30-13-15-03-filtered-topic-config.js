const poseTopicConfig={
    "topic": "/gps/fix",
    "type": "sensor_msgs/NavSatFix",
    "config": {
          "xvizStream": "/vehicle_pose"
      }
};
const topicConfig= [
{
    "topic": "/gps/imu",
    "type": "sensor_msgs/Imu",
    "config": {
          "xvizStream": "/vehicle/acceleration"
      }
},
{
    "topic": "/Odom/Velocity",
    "type": "std_msgs/Float32",
    "config": {
          "xvizStream": "/vehicle/velocity",
          "unit":"m/s"
      }
},
{
    "topic": "/velodyne_points",
    "type": "sensor_msgs/PointCloud2",
    "config":{"xvizStream":"/points/raw",
              "baseColor":{"r":10,"g":10,"b":10},"fill_color": "#707070"}//"convert":"LidarConverter"
}
]

export {poseTopicConfig,topicConfig};