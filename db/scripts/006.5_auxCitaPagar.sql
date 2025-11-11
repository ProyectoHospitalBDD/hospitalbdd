USE hospitalBD;
GO


IF OBJECT_ID('dbo.sp_Cita_Pagar','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Cita_Pagar;
GO

-- renombra v1 -> nombre final
EXEC sp_rename 'dbo.sp_Cita_Pagar_v1', 'sp_Cita_Pagar';
GO


SELECT OBJECT_ID('dbo.sp_Cita_Pagar') AS ObjId,
       OBJECTPROPERTY(OBJECT_ID('dbo.sp_Cita_Pagar'),'IsProcedure') AS EsProc;

EXEC sp_helptext 'dbo.sp_Cita_Pagar';