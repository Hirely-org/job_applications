module.exports = (sequelize, DataTypes) => {
    const JobApplication = sequelize.define('JobApplications', {
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        job_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },{
        timestamps: false,
    })
    return JobApplication;
};