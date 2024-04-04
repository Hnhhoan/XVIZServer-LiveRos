const exTopicConfig= [
    {
        "namespace":"ws//ds_1",
        "topic": "/gps/fix",
        "type": "sensor_msgs/NavSatFix",
        "config": {
              "xvizStream": "/vehicle_pose"
          }
    },    
    {
        "namespace":"ws//ds_1",
        "topic": "/gps/imu",
        "type": "sensor_msgs/Imu",
        "config": {
              "xvizStream": "/gps/imu"
          }
    }
    ,
    {
        "namespace":"ws//ds_1",
        "topic": "/velodyne_points",
        "type": "sensor_msgs/PointCloud2",
        "config":{"xvizStream":"/points/raw",
                  "baseColor":{"r":10,"g":10,"b":10},"fill_color": "#707070"}//"convert":"LidarConverter"
    },
    {
        "namespace":"ws//ds_1",
        "topic": "/Odom/Velocity",
        "type": "std_msgs/Float32",
        "config": {
              "xvizStream": "/vehicle/velocity",
              "unit":"m/s"
          }
    },
    {
        "namespace":"ws//ds_2",
        "topic": "/gps/fix",
        "type": "sensor_msgs/NavSatFix",
        "config": {
              "xvizStream": "/vehicle_pose"
          }
    },    
    {
        "namespace":"ws//ds_2",
        "topic": "/gps/imu",
        "type": "sensor_msgs/Imu",
        "config": {
              "xvizStream": "/gps/imu"
          }
    },
    {
        "namespace":"ws//ds_2",
        "topic": "/velodyne_points",
        "type": "sensor_msgs/PointCloud2",
        "config":{"xvizStream":"/points/raw",
                  "baseColor":{"r":10,"g":10,"b":10},"fill_color": "#707070"}//"convert":"LidarConverter"
    },
    {
        "namespace":"ws//ds_2",
        "topic": "/Odom/Velocity",
        "type": "std_msgs/Float32",
        "config": {
              "xvizStream": "/vehicle/velocity",
              "unit":"m/s"
          }
    }
    ]
export {exTopicConfig};