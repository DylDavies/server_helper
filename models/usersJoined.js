let mongoose = require("mongoose");

let WeekSchema = mongoose.Schema({
    ident: {
        type: String
    },
    day1:{
        number: {
            type: String
        },
        users: {
            type: String
        }
    }, 
    day2: {
        number: {
            type: String
        },
        users: {
            type: String
        }
    },
    day3: {
        number: {
            type: String
        },
        users: {
            type: String
        }
    },
    day4: {
        number: {
            type: String
        },
        users: {
            type: String
        }
    },
    day5: {
        number: {
            type: String
        },
        users: {
            type: String
        }
    },
    day6: {
        number: {
            type: String
        },
        users: {
            type: String
        }
    },
    day7: {
        number: {
            type: String
        },
        users: {
            type: String
        }
    }
})

var Week = module.exports = mongoose.model('week', WeekSchema);

module.exports.setWeek = function(newWeek){
    console.log(newWeek);
    newWeek.save();
}

module.exports.updateWeek = function(currentDay){
    let day1,
    day2,
    day3,
    day4,
    day5,
    day6,
    day7

    Week.find({}, function(err, week){
        if(err) throw err;
        if(!week) throw new Error("Week deleted");

        day1 = week.day2;
        day2 = week.day3;
        day3 = week.day4;
        day4 = week.day5;
        day5 = week.day6;
        day6 = week.day7;
        day7 = [currentDay, "0"];
    });

    Week.updateOne({ident: 'week'}, {
        $set: {
            day1: {
                number: day1[0],
                users: day1[1]
            },
            day2: {
                number: day2[0],
                users: day2[1]
            },
            day3: {
                number: day3[0],
                users: day3[1]
            },
            day4: {
                number: day4[0],
                users: day4[1]
            },
            day5: {
                number: day5[0],
                users: day5[1]
            },
            day6: {
                number: day6[0],
                users: day6[1]
            },
            day7: {
                number: day7[0],
                users: day7[1]
            }
        }
    })
}

module.exports.getD7 = async function(){
    let day7;
    await Week.find({}, function(err, week){
        if (err) throw err;
        if (!week) throw new Error("Week deleted");

        day7 = week.day7;
    });
    return day7;
}

module.exports.fetchWeek = async function(){
    let week;
    await Week.findOne({ident: 'week'}, function (err, weak) {
        if (err) throw err;
        if (!weak) throw new Error("Week deleted");

        week = weak;
    });

    return week;
}

module.exports.updateDay = function(add){
    let number;
    let users;
    Week.find({}, function (err, week) {
        if (err) throw err;
        if (!week) throw new Error("Week deleted");

        number = week.day7.number;
        if(add) users = week.day7.users++;
        else users = week.day7.users--;
    });

    Week.updateOne({ident: 'week'}, {
        $set: {
            day7:{
                number: number,
                users: users
            }
        }
    })
}