# Quiz App with NestJS


## Class Diagram
![Class Diagram](images/class_diagram.png)

## Scenario Diagram
![Scenario Diagram](images/scenario_diagram.png)


## Table of Contents
- [Step 1: Data Seeding](#step1)
- [Step 2: CRUD for Quiz and Questions](#step2)
- [Step 3: Answer Verification Function](#step3)
- [Step 4: Full Quiz Validation](#step4)
- [Step 5: Score Calculation](#step5)
- [Step 6: Commits and Documentation](#step6)

---

## Step 1: Data Seeding
### Terminal Command: `npm run seed`

**Goal:**  
Create initial datasets for 4 domains (Machine Learning, Security, DevOps, Network) with a total of 40 questions.

**Actions:**  
- Prepare JSON files for each domain containing 10 questions and answers.  
- Develop seeding scripts to populate the database with these questions.

![Database Seeding](https://github.com/Mohamedamine991/Nest-Project/assets/98351985/b95e45cb-d3a1-4850-915c-03058d8386b5)
![Database Seeding](https://github.com/Mohamedamine991/Nest-Project/assets/98351985/4ae0eefa-e00e-4858-8a58-106aaa5592ef)

---

## Step 2: CRUD for Quiz and Questions

**Goal:**  
Enable full management of quizzes and questions through CRUD operations.

**Actions:**  
- Create NestJS services and controllers for `Quiz` and `Question` entities.  
- Use TypeORM for all database operations.

---

## Step 3: Answer Verification Function

**Goal:**  
Check if the user’s submitted answers are correct.

**Actions:**  
- Add a verification method inside the `QuestionsService` to compare user answers with the correct ones.

---

## Step 4: Full Quiz Validation

**Goal:**  
Validate all quiz answers in a single operation.

**Actions:**  
- Create an API endpoint that accepts all quiz answers and returns validation results for each question.  
- Test the API with Postman.

Example JSON sent from the frontend:
```json
{
  "answers": [
    { "questionId": 1, "userAnswer": 2 },
    { "questionId": 2, "userAnswer": 3 },
    { "questionId": 3, "userAnswer": 3 },
    { "questionId": 4, "userAnswer": 3 },
    { "questionId": 5, "userAnswer": 3 },
    { "questionId": 6, "userAnswer": 3 },
    { "questionId": 7, "userAnswer": 3 },
    { "questionId": 8, "userAnswer": 3 },
    { "questionId": 9, "userAnswer": 3 },
    { "questionId": 10, "userAnswer": 3 }
  ]
}
```

![Quiz Validation Test](https://github.com/Mohamedamine991/Nest-Project/assets/98351985/aced3b28-327f-4049-ac05-de85ce3e6c21)

---

## Step 5: Score Calculation

**Goal:**  
Compute the total quiz score as a percentage.

**Actions:**  
- Update the quiz validation function to include score calculation based on correct answers.  
- Test the feature using Postman.

![Score Calculation Test](https://github.com/Mohamedamine991/Nest-Project/assets/98351985/851b3036-78a8-4dc0-8141-51feafaaecd9)

---

## Step 6: Commits and Documentation

- Properly document all functionalities and project updates.  
- Use clear, descriptive commit messages for each development step.

---