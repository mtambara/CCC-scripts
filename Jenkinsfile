pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                // Get code from a GitHub repository
                git url: 'https://github.com/mtambara/CCC-scripts', branch: 'master'
            }
        }
        stage('Compile') {
            steps {
                nodejs('default nodejs') {
                    sh "npm i"
                }
            }
        }
        stage('Run') {
            steps {
                nodejs('default nodejs') {
                    withCredentials([usernamePassword(credentialsId: '07ce8554-02ec-4ec9-86cf-01bbf95560b6', passwordVariable: 'JIRA_PASSWORD', usernameVariable: 'JIRA_USER'), file(credentialsId: 'sheets', variable: 'GSHEETS_CREDENTIAL_PATH')]) {
                        sh "node LCH\ Scipts/DevPriorities.js "
                    }
                }
            }
        }
    }
}