const express = require('express');

const {
  connectRepository,
  listRepositories,
  getRepository,
  getRepositoryArchitecture,
  getRepositoryDependencies,
  getRepositoryRisks,
  getRepositoryTechnicalDebt,
  getRepositoryReports,
  getRepositoryFileTree,
  getRepositoryFileContent,
  analyzeRepository,
  reanalyzeRepository,
  deleteRepository,
} = require('../controllers/repository.controller');

const router = express.Router();

router.post('/repositories/connect', connectRepository);

router.get('/repositories', listRepositories);

router.get('/repositories/:id', getRepository);

router.get(
  '/repositories/:id/architecture',
  getRepositoryArchitecture
);

router.get('/repositories/:id/dependencies', getRepositoryDependencies);

router.get('/repositories/:id/risks', getRepositoryRisks);

router.get('/repositories/:id/technical-debt', getRepositoryTechnicalDebt);

router.get('/repositories/:id/reports', getRepositoryReports);

router.get('/repositories/:id/files', getRepositoryFileTree);

router.get('/repositories/:id/files/content', getRepositoryFileContent);

router.post('/repositories/:id/analyze', analyzeRepository);

router.post(
  '/repositories/:id/re-analyze',
  reanalyzeRepository
);

router.delete('/repositories/:id', deleteRepository);

module.exports = router;