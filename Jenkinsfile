pipeline {
	triggers {
		cron('H 0 * * *')
	}

	agent any
	parameters {
		booleanParam(name: 'Refresh', defaultValue: false, description: 'Read Jenkinsfile and exit.')
	 }
	stages {
		stage('Read Jenkinsfile') {
			when {
				expression {
					return params.Refresh
				}
			}
			steps {
				echo("Ended pipeline early.")
			}
		}
		stage('Build') {
			when {
				expression {
					return !params.Refresh
				}
			}
			steps {
				// Get code from a GitHub repository
				git url: 'https://github.com/mtambara/CCC-scripts', branch: 'master'
			}
		}

		stage('Run') {
			when {
				expression {
					return !params.Refresh
				}
			}
			steps {
				nodejs('default nodejs') {
					sh "npm i"

					withCredentials([usernamePassword(credentialsId: '07ce8554-02ec-4ec9-86cf-01bbf95560b6', passwordVariable: 'JIRA_PASSWORD', usernameVariable: 'JIRA_USER'), file(credentialsId: 'sheets', variable: 'GSHEETS_CREDENTIAL_PATH')]) {
						sh "node LCHScripts/DevPriorities.js "
					}
				}
			}
		}
	}
}