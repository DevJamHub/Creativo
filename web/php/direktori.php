<?php
// Week 7 · Task 03: front controller. Every request to this page goes through KreatorController.
require_once __DIR__ . '/Controller/KreatorController.php';

$controller = new KreatorController();
$controller->handle($_GET);
