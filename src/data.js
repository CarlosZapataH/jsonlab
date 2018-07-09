function loadCochorts () {
  fetch('../data/cohorts.json')      
  .then(response=>response.json())
  .then(data =>{
    pushCohorts(data);        
  })
  .catch(ex=> {
    console.log(ex);
  });
}

function computeUsersStats(users, progress, courses) {

	let userStats = users.map(userWhitStats => {
		try {
			let userProgress = progress[userWhitStats.id];
			userWhitStats.stats = {
				percent: getPercentCourses(userProgress, courses),
				exercises: {
					total: totalExercises(userProgress, courses),
					completed: completedExercises(userProgress, courses),
					percent: Math.round((completedExercises(userProgress, courses)*100)/totalExercises(userProgress, courses)),
				},
				reads: {
					total:totalReads(userProgress, courses),
					completed: completedReads(userProgress, courses),
					percent: Math.round((completedReads(userProgress, courses)*100)/totalReads(userProgress, courses)),
				},
				quizzes: {
					total: totalQuizzes(userProgress, courses),
					completed: completedQuizzes(userProgress, courses),
					percent: Math.round((completedQuizzes(userProgress, courses)*100)/totalQuizzes(userProgress, courses)),
					scoreSum: scoreSumQuizzes(userProgress, courses),
					scoreAvg: Math.round(scoreSumQuizzes(userProgress, courses)/completedQuizzes(userProgress, courses)),
				}
			};
			return userWhitStats;
		} catch (error) {
			return {status: 400};
		}
	});
	return userStats;
}

function getPercentCourses(userProgress,courses){
	try {
		let TotalPercent = 0;
		for (let course of courses) {
			TotalPercent+=userProgress[course].percent;
		}
		return TotalPercent/courses.length;
	} catch(e) {
		return 0;
	}
	
}

function totalExercises(progress,courses) {
	try {
		let totalExercises = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {				
					if (parts[part].hasOwnProperty("exercises")) {
						totalExercises+=Object.keys(parts[part].exercises).length;
					}
				}
			}
		}
		return totalExercises;
	} catch(e) {
		return 0;
	}	
}

function completedExercises(progress,courses) {
	try {
		let total = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {				
					if (parts[part].hasOwnProperty("exercises")) {
						for(let exercise in parts[part].exercises ){
							if (parts[part].exercises[exercise].completed === 1)
								total ++;
						}
					}
				}
			}
		}
		return total;
	} catch(e) {
		return 0;
	}	
}

function totalReads(progress,courses) {
	try {
		let total = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {			
					if (parts[part].type==='read') {
						total++;
					}
				}
			}
		}
		return total;
	} catch(e) {
		return 0;
	}	
}

function completedReads(progress,courses) {
	try {
		let total = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {			
					if (parts[part].type==='read' && parts[part].completed===1) {
						total++;
					}
				}
			}
		}
		return total;
	} catch(e) {
		return 0;
	}
}

function totalQuizzes(progress,courses) {
	try {
		let total = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {			
					if (parts[part].type==='quiz') {
						total++;
					}
				}
			}
		}
		return total;		
	} catch(e) {
		return 0;
	}
}

function completedQuizzes(progress,courses) {
	try {
		let total = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {			
					if (parts[part].type==='quiz' && parts[part].completed===1) {
						total++;
					}
				}
			}
		}
		return total;
	} catch(e) {
		return 0;
	}
}

function scoreSumQuizzes(progress,courses) {
	try {
		let total = 0;
		for (let course of courses) {
			for(let unit in progress[course].units){
				let parts = progress[course].units[unit].parts;
				for (let part in parts) {			
					if (parts[part].type==='quiz' && parts[part].completed===1) {
						total+=parts[part].score;
					}
				}
			}
		}
		return total;
	} catch(e) {
		return 0;
	}
};

function getOptions (idCohort, OrderBy, OrderDirection, SearchName) {

	fetch('../data/cohorts.json')
	.then(response=> {return response.json()})	
	.then(cohorts=> {

		let cohort = cohorts.find(element=>{return element.id === idCohort});
		fetch('../data/cohorts/'+idCohort+'/users.json')
		.then(response=> {return response.json()})
		.then(users=> {

			fetch('../data/cohorts/'+idCohort+'/progress.json')
			.then(response=> {return response.json()})
			.then(progress=> {

				let options={
					cohort: cohort,
					cohortData: {
						users: users,
						progress: progress,
					},
					orderBy: OrderBy,
					orderDirection: OrderDirection,
					search: SearchName,
				};
				processCohortData(options);
			});
		});
	});
}

function processCohortData(options) {
	let cursos = [];	

	for(let curso in options.cohort.coursesIndex){cursos.push(curso)
	};

	let users = computeUsersStats(options.cohortData.users, options.cohortData.progress, cursos);
	
	let sorted = sortUsers (users, options.orderBy, options.orderDirection);

	let filtered = filterUsers (sorted, options.search)
	
	progressTable(filtered);
}

function sortUsers (users, orderBy, orderDirection) {	
	users.sort(function(prev,next){

		switch (parseInt(orderBy)) {
			case 1:
			prev = prev.name;
			next = next.name;
			break;

			case 2:
			prev = prev.stats.percent;
			next = next.stats.percent;
			break; 

			case 3:
			prev = prev.stats.exercises.percent;
			next = next.stats.exercises.percent;
			break; 

			case 4:
			prev = prev.stats.quizzes.percent;
			next = next.stats.quizzes.percent;
			break; 

			case 5:
			prev = prev.stats.quizzes.scoreAvg;
			next = next.stats.quizzes.scoreAvg;
			break; 

			case 6:
			prev = prev.stats.reads.percent;
			next = next.stats.reads.percent;
			break; 

			default: 
			prev = prev.name;
			next = next.name;
		}

		if (prev > next && orderDirection==='ASC') {return 1
		}
		if (prev < next && orderDirection==='ASC') {return -1
		}
		if (prev > next && orderDirection==='DESC') {return -1
		}
		if (prev < next && orderDirection==='DESC') {return 1
		}
	})
	return users
}

function filterUsers (users, search) {
	users = users.filter(user =>{
		user = user.name.toUpperCase()
		search= search.toUpperCase()
		return ((user).indexOf(search))>=0? 1 : 0;
	});
	return users	
}