from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    inspector = "inspector"
    officer = "officer"