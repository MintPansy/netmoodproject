<?php
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['success'=>true,'message'=>'system ok','time'=>date(DATE_ATOM)]);
